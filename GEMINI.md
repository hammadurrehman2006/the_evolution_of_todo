# GEMINI.md - System Instructions

## Tool Use & Function Calling Policy
**CRITICAL:** You are strictly PROHIBITED from using "Parallel Function Calling".
The current API client cannot handle multiple function calls in a single turn (it triggers a `400 INVALID_ARGUMENT` error stating "number of function response parts is equal to the number of function call parts").

### Rules for Tool Execution:
1.  **Sequential Only:** You must output only **ONE** `function_call` per turn.
2.  **Chain of Thought:** If a user request requires multiple tools (e.g., "Check weather in London and Paris"):
    * Call the tool for London.
    * Wait for the system response.
    * *Then* call the tool for Paris in the next turn.
3.  **Never** output a list of tools. Always wait for the result of the first tool before deciding the next step.
