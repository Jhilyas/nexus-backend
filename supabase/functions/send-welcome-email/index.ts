
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { email, name } = await req.json();

        if (!email) {
            throw new Error("Email is required");
        }

        const { data, error } = await resend.emails.send({
            from: "NEXUS <onboarding@resend.dev>", // Update with verified domain if available
            to: [email],
            bcc: ["nexus-morocco.com+d6bcdf65bf@invite.trustpilot.com"],
            subject: "Bienvenue sur NEXUS ! 🚀",
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Bienvenue, ${name || 'Futur Expert'} !</h1>
          <p>Nous sommes ravis de vous compter parmi nous.</p>
          <p>NEXUS est votre compagnon pour réussir votre orientation et vos études.</p>
          <br>
          <p>À très vite sur la plateforme,</p>
          <p><strong>L'équipe NEXUS</strong></p>
        </div>
      `,
        });

        if (error) {
            console.error("Resend Error:", error);
            return new Response(JSON.stringify({ error }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            });
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
