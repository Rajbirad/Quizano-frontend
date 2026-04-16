import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const GoogleOAuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      // Send code to backend to exchange for tokens
      fetch("https://api.studyflash.co/api/auth/production/google-oauth-callback?code=" + code)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            toast({ title: "Google login successful!" });
            // Save token or login state
            localStorage.setItem('isLoggedIn', 'true');
            navigate("/app/dashboard");
          } else {
            toast({ 
              title: "Google login failed", 
              description: data.message, 
              variant: "destructive" 
            });
            navigate("/login");
          }
        })
        .catch(error => {
          console.error('OAuth callback error:', error);
          toast({ 
            title: "Google login failed", 
            description: "Network error occurred", 
            variant: "destructive" 
          });
          navigate("/login");
        });
    } else {
      toast({ 
        title: "No authorization code found", 
        variant: "destructive" 
      });
      navigate("/login");
    }
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Processing Google login...</p>
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;