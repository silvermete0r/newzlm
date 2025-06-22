import { useEffect } from "react";

const GoogleTranslateWidget = () => {
  useEffect(() => {
    // Inject Google Translate script only once
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);

      // Define the callback function globally
      window.googleTranslateElementInit = function () {
        // eslint-disable-next-line no-undef
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,ru,kk,uz,ky,tk,zh,fr,de,es,tr", // add/remove as needed
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      };
    }
  }, []);

  return (
    <div id="google_translate_element" style={{ position: "fixed", top: 8, right: 8, zIndex: 9999 }} />
  );
};

export default GoogleTranslateWidget;
