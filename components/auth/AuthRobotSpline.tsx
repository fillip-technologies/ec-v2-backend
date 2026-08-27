"use client";

import React, { useState } from "react";

interface AuthRobotSplineProps {
  sceneUrl?: string;
}

export const AuthRobotSpline: React.FC<AuthRobotSplineProps> = ({
  sceneUrl = "https://my.spline.design/robotfollowcursorforlandingpage-f11Rc2js8cf5Tfzla4AM0K3F/",
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative flex min-h-[500px] sm:min-h-[650px] items-center justify-center">
      {/* Background Radial Glow */}
      <div className="absolute h-[380px] w-[380px] sm:h-[450px] sm:w-[450px] rounded-full bg-brand/25 blur-[120px]" />

      {/* Spline iFrame Wrapper */}
      <div className="relative z-10 h-[550px] sm:h-[650px] w-full overflow-hidden rounded-[2rem]">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/20 backdrop-blur-md">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand">
              Loading Interactive Portal...
            </p>
          </div>
        )}

        <iframe
          src={sceneUrl}
          frameBorder="0"
          width="100%"
          height="100%"
          onLoad={() => setLoaded(true)}
          className="h-[calc(100%+72px)] w-full border-0"
          title="Engineers Clinic Interactive 3D Robot"
        />
      </div>
    </div>
  );
};
