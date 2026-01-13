import React from 'react';

// Wir übergeben 'onStart' als Eigenschaft (Prop) an die Seite
const StartPage = ({ onStart }) => {
  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-white">
      <div className="relative w-full h-[832px] overflow-hidden bg-white">
        
        {/* Hintergrund-Rechteck */}
        <img
          src="/rectangle51026-13q-200h.png"
          className="absolute top-[611px] left-[393px] w-[494px] h-[115px] opacity-[0.74] rounded-[47px] cursor-pointer"
          onClick={onStart} // Klick-Event hinzugefügt
        />

        <img
          src="/image11012-anyd-300h.png"
          className="absolute top-[89px] left-[188px] w-[452px] h-[254px]"
        />

        <span className="absolute top-[89px] left-[554px] text-[#880c9e] text-[96px] font-bold font-['Poppins']">
          Premier<br />League
        </span>

        {/* Der Text-Button */}
        <span 
          className="absolute top-[619px] left-[405px] text-black text-[64px] font-bold font-['Poppins'] cursor-pointer"
          onClick={onStart} // Klick-Event hinzugefügt
        >
          Get Table 2018
        </span>

      </div>
    </div>
  );
};

export default StartPage;