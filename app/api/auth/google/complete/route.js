import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const expiryDate = searchParams.get("expiry_date");
    const calendarName = searchParams.get("calendar_name");

    // Create a response that redirects to calendar with connection data
    const redirectUrl = new URL("/calendar", request.url);
    redirectUrl.searchParams.set("google_calendar_success", "true");

    // Store tokens in session storage via client-side script
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Connecting Google Calendar...</title>
      <script>
        // Store connection data in session storage for client-side handling
        sessionStorage.setItem('google_calendar_connection', JSON.stringify({
          accessToken: '${accessToken}',
          refreshToken: '${refreshToken || ""}',
          expiryDate: ${expiryDate || "null"},
          calendarName: '${calendarName}'
        }));
        
        // Redirect to calendar page
        window.location.href = '${redirectUrl.toString()}';
      </script>
    </head>
    <body>
      <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h2>Connecting your Google Calendar...</h2>
        <p>Please wait while we complete the connection.</p>
      </div>
    </body>
    </html>
    `;

    return new Response(html, {
      headers: {
        "content-type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error completing Google Calendar connection:", error);
    return NextResponse.redirect(
      new URL("/settings?google_calendar_error=completion_failed", request.url)
    );
  }
}
