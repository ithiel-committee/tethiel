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
