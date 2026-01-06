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
        print(f"[Auth Debug] Token Algorithm: {alg}")
        
        payload = None

        if alg == settings.jwt_algorithm:
            print(f"[Auth Debug] Using symmetric verification ({alg})")
            # Handle standard symmetric encryption (e.g. HS256)
            payload = jwt.decode(
                token,
                settings.jwt_secret,
                algorithms=[settings.jwt_algorithm]
            )
        else:
            print(f"[Auth Debug] Using asymmetric verification ({alg})")
            
            # Fetch all available keys from DB
            all_jwks = session.exec(select(Jwks)).all()
            print(f"[Auth Debug] Found {len(all_jwks)} keys in Jwks table")
            
            if not all_jwks:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: no keys available"
                )

            # Helper to parse and verify with a single DB record
            def try_verify(record, token_kid):
                try:
                    public_key_str = record.publicKey
                    
                    # Handle JWK JSON format
                    if public_key_str.strip().startswith("{"):
                        import json
                        from jwt import PyJWK
                        
                        key_data = json.loads(public_key_str)
                        
                        # Handle potential JWKS wrapper {"keys": [...]}
                        if "keys" in key_data and isinstance(key_data["keys"], list):
                             # Try all keys in the set
                             for k in key_data["keys"]:
                                 try:
                                     jwk_obj = PyJWK(k)
                                     # Check kid if present
                                     if token_kid and k.get("kid") and k.get("kid") != token_kid:
                                         continue
                                         
                                     decoded = jwt.decode(
                                         token, 
                                         key=jwk_obj.key, 
                                         algorithms=[alg],
                                         options={"verify_aud": False, "verify_iss": False}
                                     )
                                     return decoded
                                 except Exception as e:
                                     # print(f"[Auth Debug] Key in set failed: {e}")
                                     continue
                             return None

                        # Single JWK
                        jwk_obj = PyJWK(key_data)
                        
                        # Check kid if we have one in the JWK
                        jwk_kid = key_data.get("kid")
                        if token_kid and jwk_kid and jwk_kid != token_kid:
                            # Mismatch in JWK content kid
                            return None
                            
                        return jwt.decode(
                            token, 
                            key=jwk_obj.key, 
                            algorithms=[alg],
                            options={"verify_aud": False, "verify_iss": False}
                        )
                    
                    # Handle PEM format (fallback)
                    # For PEM, we assume the record.id might be the kid
                    if token_kid and record.id != token_kid:
                        return None
                        
                    return jwt.decode(
                        token, 
                        key=public_key_str, 
                        algorithms=[alg],
                        options={"verify_aud": False, "verify_iss": False}
                    )
                except Exception as e:
                    print(f"[Auth Debug] Verification failed for key {record.id}: {e}")
                    return None

            # 1. Try to find precise match by kid if available
            token_kid = header.get("kid")
            if token_kid:
                print(f"[Auth Debug] looking for kid: {token_kid}")
                # First try the record with matching ID
                matching_record = next((r for r in all_jwks if r.id == token_kid), None)
                if matching_record:
                    print(f"[Auth Debug] Found record with matching ID: {matching_record.id}")
                    payload = try_verify(matching_record, token_kid)
                    if payload:
                        print("[Auth Debug] Verified with matching record ID")
            
            # 2. If no payload yet, try ALL keys (rotation/mismatched IDs support)
            if not payload:
                print("[Auth Debug] Trying all available keys...")
                for record in all_jwks:
                    # Skip if we already tried it (optimization)
                    if token_kid and record.id == token_kid:
                        continue
                        
                    payload = try_verify(record, token_kid)
                    if payload:
                        print(f"[Auth Debug] Verified with key ID: {record.id}")
                        break

            if not payload:
                 raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: signature verification failed"
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
