import { Info } from "lucide-react";
import { useUIText } from "../../context/UIModeContext";
import { ModalShell } from "../ui/ModalShell";

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditModal: React.FC<CreditModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useUIText();

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t("creditsTitle")}
      icon={<Info size={16} className="text-sky-400" />}
    >
      <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
        <div className="p-2.5 bg-slate-900/80 rounded border border-rose-500/30">
          <div className="text-rose-400 font-bold mb-1">
            teThieL - iTL防衛戦
          </div>
          <p className="text-[11px]">
            中央大学 国際情報学部 (iTL) 公式キャラクター
            「イティエル」をモチーフにしたパズルゲーム
          </p>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded border border-rose-500/30 space-y-1 text-[11px]">
          <div>企画・イラスト: iSC (iThiel Support Committee)</div>
          <div>
            開発: wash (
            <a href="https://x.com/ln67v" style={{ color: "skyblue" }}>
              @ln67v
            </a>
            ) from iSC
          </div>
          <div>
            キャラクター原案: DNP (大日本印刷)・iTLコンテンツプロダクション
          </div>
          <div>SPECIAL THANKS: プレイヤーの皆さん！</div>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded border border-rose-500/30 space-y-1 text-[11px]">
          <div className="text-rose-400 font-bold mb-1">BGM / 音楽</div>
          <div>
            タイトル:{" "}
            <a
              href="https://www.youtube.com/watch?v=xW1cyHu-Bog"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "skyblue" }}
            >
              J'azz Blue
            </a>{" "}
            by RoccoW (CC BY-SA)
          </div>
          <div>
            ゲーム:{" "}
            <a
              href="https://www.youtube.com/watch?v=mit5CYgctLQ"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "skyblue" }}
            >
              Hellish Revenge
            </a>{" "}
            by Weeppiko (CC BY-NC-SA 3.0)
          </div>
          <div>
            ストーリー・リザルト:{" "}
            <a
              href="https://youtu.be/Y2qWBZQT3go"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "skyblue" }}
            >
              Messeah
            </a>{" "}
            by RoccoW (CC BY 3.0)
          </div>
        </div>
      </div>

      <div className="ranking-footer">
        <div />
        <button type="button" className="ranking-close-btn" onClick={onClose}>
          {t("closeButton")}
        </button>
      </div>
    </ModalShell>
  );
};
