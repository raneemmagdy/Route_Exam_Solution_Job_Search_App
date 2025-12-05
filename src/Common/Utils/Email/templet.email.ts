export const verifyEmail = ({  title, body }: { title: string, body: string }): string => {
  return ` 
   <div style="max-width: 480px; margin: auto; padding: 30px 20px; font-family: 'Segoe UI', Tahoma, sans-serif; background: #ffffff; border: 1px solid #eee; border-radius: 16px;">
  
  <h2 style="color:#111; text-align:center; font-size:24px; font-weight:700; margin-bottom: 10px;">
    ${title}
  </h2>
  
    ${body}
  <hr style="border:none; border-top:1px solid #f0f0f0; margin:25px 0;">
  
  <p style="font-size:12px; color:#aaa; text-align:center;">
    &copy; 2025 Job Search Application. All rights reserved.
  </p>
  
</div>


`
}