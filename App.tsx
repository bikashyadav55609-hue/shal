import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AnniversaryContent,
  AnniversaryProgress,
  ChapterId,
  FlowerId,
} from './types/anniversary';
import {
  clampChapter,
  collectFlower,
  createDefaultContent,
  markLetterOpened,
} from './utils/anniversaryStore';
import {
  loadPersistedContent,
  loadPersistedProgress,
  savePersistedContent,
  savePersistedProgress,
} from './utils/browserStorage';
import { PetalOverlay } from './components/PetalOverlay';
import { DecorativeElements } from './components/DecorativeElements';
import { MusicControllerHandle, MusicPlayer } from './components/MusicPlayer';
import { ChapterHeader } from './components/ChapterHeader';
import { ChapterOneWelcome } from './components/ChapterOneWelcome';
import { ChapterTwoGallery } from './components/ChapterTwoGallery';
import { ChapterThreeReasons } from './components/ChapterThreeReasons';
import { ChapterFourFinale } from './components/ChapterFourFinale';
import { CustomizationPanel } from './components/CustomizationPanel';

export default function App() {
  const [content, setContent] = useState<AnniversaryContent>(() =>
    createDefaultContent()
  );
  const [progress, setProgress] = useState<AnniversaryProgress>(() =>
    loadPersistedProgress()
  );
  const [currentChapter, setCurrentChapter] = useState<ChapterId>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return clampChapter(Number(params.get('chapter') || 2));
    }
    return 1;
  });
  const [previewMode, setPreviewMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('autostart') === '1';
  });
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [customizeInitialTab, setCustomizeInitialTab] = useState<
    'personal' | 'gallery' | 'messages' | 'music'
  >('personal');
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [contentHydrated, setContentHydrated] = useState(false);

  const musicRef = useRef<MusicControllerHandle | null>(null);

  useEffect(() => {
    let active = true;
    loadPersistedContent().then((loaded) => {
      if (!active) return;
      setContent(loaded);
      setContentHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', content.theme);
  }, [content.theme]);

  useEffect(() => {
    savePersistedProgress(progress);
  }, [progress]);

  useEffect(() => {
    if (!contentHydrated) return;
    savePersistedContent(content).then((result) => {
      if (!result.ok && result.warning) {
        setStorageWarning(result.warning);
      } else {
        setStorageWarning(null);
      }
    });
  }, [content, contentHydrated]);

  const navigateToChapter = (chapter: ChapterId) => {
    setCurrentChapter(chapter);
    setProgress((prev) => ({
      ...prev,
      highestUnlockedChapter: Math.max(
        prev.highestUnlockedChapter,
        chapter
      ) as ChapterId,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFirstChapterOpen = () => {
    musicRef.current?.startFromUserGesture();
    setProgress((prev) => ({
      ...prev,
      chapter1Opened: true,
    }));
  };

  const handleCollectFlower = (flowerId: FlowerId) => {
    setProgress((prev) => collectFlower(prev, flowerId).progress);
  };

  const handleOpenLetter = (letterId: string) => {
    setProgress((prev) => markLetterOpened(prev, letterId));
  };

  const handlePandaHug = () => {
    setProgress((prev) => ({
      ...prev,
      pandaHugCount: prev.pandaHugCount + 1,
    }));
  };

  const handleBouquetAssembled = () => {
    setProgress((prev) => ({
      ...prev,
      bouquetAssembled: true,
    }));
  };

  const handleOpenFinalLetter = () => {
    setProgress((prev) => ({
      ...prev,
      finalLetterOpened: true,
    }));
  };

  const handleReplay = () => {
    setCurrentChapter(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const petalsActive = true;

  return (
    <div className="relative min-h-screen bg-[var(--theme-bg)] text-[var(--theme-ink)] transition-colors duration-500">
      <PetalOverlay active={petalsActive} nightMode={currentChapter === 4} />
      <DecorativeElements currentChapter={currentChapter} />

      <ChapterHeader
        siteTitle={content.siteTitle}
        currentChapter={currentChapter}
        highestUnlockedChapter={progress.highestUnlockedChapter}
        previewMode={previewMode}
        onSelectChapter={navigateToChapter}
        onOpenCustomize={() => {
          setCustomizeInitialTab('personal');
          setCustomizeOpen(true);
        }}
        musicSlot={
          <MusicPlayer
            ref={musicRef}
            config={content.music}
            nightMode={false}
          />
        }
      />

      <main className="relative z-20">
        <AnimatePresence mode="wait">
          {currentChapter === 1 && (
            <motion.div
              key="chapter-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <ChapterOneWelcome
                content={content}
                opened={progress.chapter1Opened}
                onFirstOpen={handleFirstChapterOpen}
                onProceedToChapter2={() => navigateToChapter(2)}
              />
            </motion.div>
          )}

          {currentChapter === 2 && (
            <motion.div
              key="chapter-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <ChapterTwoGallery
                content={content}
                onPrevChapter={() => navigateToChapter(1)}
                onNextChapter={() => navigateToChapter(3)}
                onOpenGalleryCustomize={() => {
                  setCustomizeInitialTab('gallery');
                  setCustomizeOpen(true);
                }}
              />
            </motion.div>
          )}

          {currentChapter === 3 && (
            <motion.div
              key="chapter-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <ChapterThreeReasons
                content={content}
                progress={progress}
                onCollectFlower={handleCollectFlower}
                onOpenLetter={handleOpenLetter}
                onPandaHug={handlePandaHug}
                onPrevChapter={() => navigateToChapter(2)}
                onNextChapter={() => navigateToChapter(4)}
              />
            </motion.div>
          )}

          {currentChapter === 4 && (
            <motion.div
              key="chapter-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            >
              <ChapterFourFinale
                content={content}
                bouquetAssembled={progress.bouquetAssembled}
                finalLetterOpened={progress.finalLetterOpened}
                onBouquetAssembled={handleBouquetAssembled}
                onOpenFinalLetter={handleOpenFinalLetter}
                onPrevChapter={() => navigateToChapter(3)}
                onReplay={handleReplay}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CustomizationPanel
        isOpen={customizeOpen}
        initialTab={customizeInitialTab}
        content={content}
        previewMode={previewMode}
        storageWarning={storageWarning}
        onClose={() => setCustomizeOpen(false)}
        onChangeContent={setContent}
        onTogglePreviewMode={setPreviewMode}
        onJumpToChapter={navigateToChapter}
      />
    </div>
  );
}
