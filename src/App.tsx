import { LanguageProvider } from './context/LanguageContext';
import { ResumeProvider } from './context/ResumeContext';
import { LusionRibbonCanvas } from './components/LusionRibbonCanvas';
import { LusionHero } from './components/LusionHero';
import { HorizontalStoryStage } from './components/HorizontalStoryStage';
import { InteractiveMascot } from './components/InteractiveMascot';

export function App() {
  return (
    <LanguageProvider>
      <ResumeProvider>
        <div className="min-h-screen w-full bg-[#f4f6f8] text-slate-950 relative overflow-x-clip font-sans">
          {/* 1. Lusion 风格青蓝流体丝带画布（随向下滚动平滑绘制，固定于底层） */}
          <LusionRibbonCanvas />

          {/* 2. 极简高端 Hero 界面与顶部常驻导航 */}
          <LusionHero />

          {/* 3. 经典计算机科学论文展卷、字母抽取飞入拼词与横向平滑滚屏多模块阶段 */}
          <HorizontalStoryStage />

          {/* 4. 卡通男孩跳跃互动角色（常驻视口右下角） */}
          <InteractiveMascot />
        </div>
      </ResumeProvider>
    </LanguageProvider>
  );
}

export default App;
