import React from 'react';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';

export const SignIn: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-niyama-gray-50 to-niyama-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-niyama-black border-4 border-niyama-black mx-auto mb-4 flex items-center justify-center shadow-brutal-lg">
              <div className="w-8 h-8 bg-niyama-accent border-2 border-niyama-white flex items-center justify-center">
                <div className="w-4 h-4 bg-niyama-black"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-niyama-black mb-2">Welcome Back</h1>
            <p className="text-niyama-gray-600">Sign in to your Niyama account</p>
          </div>
          
          <ClerkSignIn 
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent border-0 shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border-2 border-niyama-black bg-niyama-white shadow-brutal hover:shadow-brutal-lg transition-all duration-200 hover:scale-105',
                formButtonPrimary: 'bg-niyama-accent text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 hover:scale-105',
                formFieldInput: 'border-2 border-niyama-black bg-niyama-white shadow-brutal focus:shadow-brutal-lg transition-all duration-200',
                footerActionLink: 'text-niyama-accent hover:text-niyama-black font-bold',
                identityPreviewText: 'text-niyama-gray-600',
                formResendCodeLink: 'text-niyama-accent hover:text-niyama-black font-bold'
              }
            }}
            redirectUrl="/"
          />
        </div>
      </div>
    </div>
  );
};