import { useEffect, useRef, useState } from "react";

interface WordCloudData {
  text: string;
  value: number;
}

interface WordCloudProps {
  data: WordCloudData[];
}

const WordCloud = ({ data }: WordCloudProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [noSenseWords, setNoSenseWords] = useState<string[]>([]);

  useEffect(() => {
    fetch("/no-sense.txt")
      .then(res => res.text())
      .then(txt => {
        setNoSenseWords(
          txt
            .split(/\r?\n/)
            .map(w => w.trim().toLowerCase())
            .filter(Boolean)
        );
      });
  }, []);

  const filteredData = data.filter(
    word => !noSenseWords.includes(word.text.toLowerCase())
  );

  const getRandomPosition = () => ({
    x: Math.random() * 80 + 10, // 10% to 90% of container width
    y: Math.random() * 60 + 20, // 20% to 80% of container height
  });

  const getFontSize = (value: number) => {
    const min = 16;
    const max = 48;
    const values = filteredData.map(d => d.value);
    const normalized = (value - Math.min(...values)) / 
                      (Math.max(...values) - Math.min(...values) || 1);
    return min + (max - min) * normalized;
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-80 w-full bg-white border border-gray-200 rounded-lg overflow-hidden"
    >
      {filteredData.map((word, index) => {
        const position = getRandomPosition();
        const fontSize = getFontSize(word.value);
        
        return (
          <div
            key={word.text}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-black hover:text-gray-600 cursor-pointer transition-colors duration-300 font-poppins font-semibold select-none"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              fontSize: `${fontSize}px`,
              opacity: 0.7 + (word.value / 100) * 0.3,
            }}
          >
            {word.text}
          </div>
        );
      })}
    </div>
  );
};

export default WordCloud;
