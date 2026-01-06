"""FastAPI dependencies for authentication and authorization."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from sqlmodel import Session, select
from config import settings
from database import get_session
from models import Jwks

# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> str:
    """
    Extract and validate user_id from JWT Bearer token.
    Supports both HS256 (shared secret) and RS256/EdDSA (JWKS) verification.

    Args:
        credentials: HTTP Authorization credentials with Bearer token
        session: Database session for retrieving JWKS keys

    Returns:
        str: User ID extracted from token payload

    Raises:
        HTTPException: 401 if token is invalid, expired, or missing user_id
    """
    token = credentials.credentials

    try:
        # Get unverified header to check algorithm
        header = jwt.get_unverified_header(token)
        alg = header.get("alg")
        
        payload = None

        if alg == settings.jwt_algorithm:
            # Handle standard symmetric encryption (e.g. HS256)
            payload = jwt.decode(
                token,
                settings.jwt_secret,
                algorithms=[settings.jwt_algorithm]
            )
        else:
            # Handle asymmetric encryption (e.g. RS256, EdDSA) via JWKS
            # Try to find a matching key in the DB
            statement = select(Jwks)
            # If kid is present, filter by it (assuming id maps to kid or we iterate)
            # Better Auth often uses the 'id' as the Key ID
            if "kid" in header:
                 statement = statement.where(Jwks.id == header["kid"])
            
            # Get the key(s)
            jwk_record = session.exec(statement).first()
            
            if not jwk_record:
                # Fallback: try to get the most recent key if no kid match
                # or if kid was missing
                jwk_record = session.exec(select(Jwks).order_by(Jwks.createdAt.desc())).first()

            if not jwk_record:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: no matching key found"
                )

            # PyJWT expects the public key in PEM format or similar
            # Better Auth stores it as a string, likely PEM or JWK JSON
            # If it's a JWK JSON string, PyJWT might need conversion.
            # Assuming PEM for now as it's common in SQL storage, but we might need to handle JWK format.
            public_key = jwk_record.publicKey
            
            # If the key is a raw JSON string (JWK), PyJWT supports strict JWK via `jwt.PyJWK`
            # But standard `jwt.decode` takes a key. 
            # If better-auth stores standard PEM, this works. 
            # If it stores a JSON object string, we might need to parse it.
            
            try:
                import json
                if public_key.strip().startswith("{"):
                    # It's likely a JWK JSON string
                    from jwt.algorithms import RSAAlgorithm
                    key_data = json.loads(public_key)
                    public_key = RSAAlgorithm.from_jwk(json.dumps(key_data))
            except Exception:
                # Assume it's PEM or handled by PyJWT
                pass

            payload = jwt.decode(
                token,
                key=public_key,
                algorithms=[alg]
            )

        # Extract user_id from 'sub' or 'user_id' claim
        user_id: str = payload.get("sub") or payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id claim"
            )

        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.InvalidTokenError as e:
        print(f"Token validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        print(f"Unexpected auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )
