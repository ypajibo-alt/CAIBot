import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  console.log("RFD GET ping");
  return NextResponse.json({ ok: true, ping: "pong" });
}

export async function POST(request: NextRequest) {
  try {
    console.log("HAS_RESEND_KEY", !!process.env.RESEND_API_KEY);
    console.log("EMAIL_FROM", process.env.EMAIL_FROM);
    console.log("RFD_NOTIFY_TO", process.env.RFD_NOTIFY_TO);
    
    const data = await request.json();
    
    // Generate unique short ID for this submission
    const shortId = Math.random().toString(36).slice(2, 8).toUpperCase(); // e.g., "K3P9QZ"
    
    // Validate required fields
    if (!data.name || !data.email || !data.logline || !data.link) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not found, logging submission instead:', data);
      return NextResponse.json({ ok: true });
    }

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Environment variables with defaults
    const notifyTo = process.env.RFD_NOTIFY_TO || 'ypajibo@tubi.tv';
    const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    // Prepare email content
    const subject = `RFD Distribution Request [${shortId}]`; // ← unique per email
    const htmlContent = `
      <h2>New RFD Distribution Request [${shortId}]</h2>
      
      <h3>Submitter Information</h3>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      
      <h3>Submission Details</h3>
      <p><strong>Submission Type:</strong> ${data.submissionType || 'Not specified'}</p>
      <p><strong>Rights:</strong> ${data.rights || 'Not specified'}</p>
      ${data.territories ? `<p><strong>Territories:</strong> ${data.territories}</p>` : ''}
      
      <h3>Content Information</h3>
      <p><strong>Logline:</strong></p>
      <p>${data.logline.replace(/\n/g, '<br>')}</p>
      
      <p><strong>Film/Series Link:</strong> <a href="${data.link}" target="_blank">${data.link}</a></p>
      
      <hr>
      <p><small>Submission ID: ${shortId} | Submitted via Tubi RFD Intake Form</small></p>
    `;

    const textContent = `
New RFD Distribution Request [${shortId}]

Submitter Information:
Name: ${data.name}
Email: ${data.email}

Submission Details:
Submission Type: ${data.submissionType || 'Not specified'}
Rights: ${data.rights || 'Not specified'}
${data.territories ? `Territories: ${data.territories}` : ''}

Content Information:
Logline:
${data.logline}

Film/Series Link: ${data.link}

---
Submission ID: ${shortId} | Submitted via Tubi RFD Intake Form
    `;

    // Send ONLY internal notification email (no copy to submitter)
    const sendResult = await resend.emails.send({
      from: emailFrom,
      to: notifyTo,
      subject,                       // now unique
      html: `${htmlContent}<p style="color:#666">Ref: ${shortId}</p>`,
      text: `${textContent}\n\nRef: ${shortId}`,
      replyTo: data.email,
    });

    if (sendResult?.error) {
      console.error("RESEND_ERROR", sendResult.error);
      return NextResponse.json({ ok: false, error: sendResult.error.message }, { status: 500 });
    }

    console.log("RESEND_OK", sendResult.data?.id);
    return NextResponse.json({ ok: true, id: sendResult.data?.id }, { status: 200 });

  } catch (error) {
    console.error('RFD intake error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}
