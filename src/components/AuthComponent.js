import React from 'react';

const AuthComponent = ({ user, supabase }) => {
  const handleSignIn = async () => {
    // Implement sign in logic
    console.log('Sign in clicked');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="auth-component">
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <p>Please sign in to continue</p>
          <button onClick={handleSignIn}>Sign In</button>
        </div>
      )}
    </div>
  );
};

export default AuthComponent;
