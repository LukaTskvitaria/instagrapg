"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Instagram, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "2158863041303094";

export default function AuthPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInstagramConnect = () => {
    setIsConnecting(true);
    setError(null);

    // Mock demo mode - simulate successful connection
    setTimeout(() => {
      // Simulate successful Instagram connection
      localStorage.setItem('auth_token', 'demo-token-12345');
      localStorage.setItem('user_info', JSON.stringify({
        name: 'Demo User',
        email: 'demo@instagraph.app',
        instagram_username: '@demo_account',
        followers_count: 15420,
        following_count: 892,
        posts_count: 156
      }));
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }, 2000); // 2 second delay to show loading
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <Instagram className="h-12 w-12 text-purple-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Instagram ანგარიშის დაკავშირება</h1>
          <p className="text-gray-400">დააკავშირეთ თქვენი Instagram Business ანგარიში ანალიტიკის მისაღებად</p>
        </div>

        {/* Requirements Card */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              მოთხოვნები
            </CardTitle>
            <CardDescription className="text-gray-400">
              დარწმუნდით, რომ თქვენი ანგარიში აკმაყოფილებს ამ პირობებს
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center text-sm text-gray-300">
              <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
              Instagram Business ან Creator ანგარიში
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
              Facebook Page-თან დაკავშირებული
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
              Facebook Business Manager წვდომა
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-900/50 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Connect Button */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <Button 
              onClick={handleInstagramConnect}
              disabled={isConnecting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  დაკავშირება...
                </>
              ) : (
                <>
                  <Instagram className="h-4 w-4 mr-2" />
                  Instagram-ის დაკავშირება
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              დაკავშირებით თქვენ ეთანხმებით InstaGraph-ს წვდომას თქვენს Instagram Business მონაცემებზე ანალიტიკის მიზნებისთვის
            </p>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-sm text-white">დახმარება</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-gray-400">
              <strong>Personal Account გაქვთ?</strong> გადაიყვანეთ Business-ზე Instagram Settings → Professional account → Business-ში
            </p>
            <p className="text-xs text-gray-400">
              <strong>Facebook Page არ გაქვთ?</strong> შექმენით Facebook Page და დააკავშირეთ Instagram ანგარიშს
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Facebook SDK Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.fbAsyncInit = function() {
              FB.init({
                appId: '${FACEBOOK_APP_ID}',
                cookie: true,
                xfbml: true,
                version: 'v18.0'
              });
            };

            (function(d, s, id) {
              var js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) return;
              js = d.createElement(s); js.id = id;
              js.src = "https://connect.facebook.net/en_US/sdk.js";
              fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
          `
        }}
      />
    </div>
  );
}
