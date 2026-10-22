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
            「イティエル」をモチーフにした逆テトリス型アクションパズル
          </p>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded border border-rose-500/30 space-y-1 text-[11px]">
          <div>企画・開発: iTL 委員会</div>
          <div>キャラクターイラスト・原案: iTL 公式</div>
          <div>サウンド: Web Audio API Synthesizer Engine</div>
          <div className="pt-1 text-slate-400">
            SPECIAL THANKS: プレイヤーの皆様
          </div>
        </div>
      </div>

      <div className="ranking-footer">
        <div />
        <button
          type="button"
          className="ranking-close-btn"
          onClick={onClose}
        >
          {t("closeButton")}
        </button>
      </div>
    </ModalShell>
  );
};
