export async function sendCodeExecutionRequest(code: string): Promise<any> {
  const response = await fetch("/kernel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return response.json();
}
