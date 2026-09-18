import React, { useEffect, useState, useCallback } from 'react';

interface LusionAnimatedTitleProps {
  lines?: string[];
  className?: string;
  onReplay?: () => void;
}

export const LusionAnimatedTitle: React.FC<LusionAnimatedTitleProps> = ({
  lines = ['Bold Ideas,', 'Brought to Life'],
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const triggerAnimation = useCallback(() => {
    setIsVisible(false);
    // 使用双 requestAnimationFrame 确保浏览器完成重绘并平滑应用过渡
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });
  }, []);

  useEffect(() => {
    // 页面初次载入时自动触发
    const timer = setTimeout(() => {
      triggerAnimation();
    }, 80);

    // 监听重新播放事件（如点击男孩或顶部重播按钮）
    const handleReplay = () => {
      setAnimKey((prev) => prev + 1);
      triggerAnimation();
    };

    window.addEventListener('replay-mascot-jump', handleReplay);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('replay-mascot-jump', handleReplay);
    };
  }, [triggerAnimation]);

  // 统计全局词序号以计算阶梯式延迟（Stagger Delay）
  let globalWordIndex = 0;

  return (
    <div key={animKey} className={`select-none ${className}`}>
      {lines.map((line, lineIdx) => {
        const words = line.split(' ');
        return (
          <div
            key={lineIdx}
            className="flex flex-wrap items-baseline overflow-hidden leading-[0.96] py-1"
            style={{
              // 确保词语在行内自然排布，且下沿留出旋转空间
              clipPath: 'polygon(0 0, 100% 0, 100% 120%, 0 120%)',
            }}
          >
            {words.map((word, wordIdx) => {
              const currentIdx = globalWordIndex++;
              // Lusion 原版阶梯延迟：每个词错开约 75ms
              const delay = 0.12 + currentIdx * 0.075;

              return (
                <span
                  key={wordIdx}
                  className="inline-block overflow-hidden mr-[0.24em] last:mr-0 align-bottom"
                >
                  <span
                    className="inline-block transition-all duration-[1050ms] will-change-transform cursor-default"
                    style={{
                      // 严格还原 Lusion 专有缓动：cubic-bezier(0.35, 0, 0, 1)
                      transitionTimingFunction: 'cubic-bezier(0.35, 0, 0, 1)',
                      transitionDelay: `${delay}s`,
                      transformOrigin: '0% 100%', // 左下角作为旋转支点
                      transform: isVisible
                        ? 'translate3d(0, 0, 0) rotate(0deg)'
                        : 'translate3d(0, 120%, 0) rotate(10deg)',
                      opacity: isVisible ? 1 : 0,
                    }}
                  >
                    {word}
                  </span>
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
