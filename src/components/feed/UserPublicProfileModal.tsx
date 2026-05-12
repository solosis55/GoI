import { useEffect } from "react";
import { createPortal } from "react-dom";
import { usePublicProfile } from "../../hooks/usePublicProfile";
import { PublicProfileBody } from "./PublicProfileBody";

type UserPublicProfileModalProps = {
  userId: string | null;
  currentUserId: string | undefined;
  initialFollowingIds: string[];
  onClose: () => void;
  /** Tras seguir/dejar de seguir desde el modal (para sincronizar el feed sin recargarlo). */
  onFollowingChanged?: (targetUserId: string, following: boolean) => void;
  /** Cierra el modal y abre la vista de perfil completa en la pestaña Perfil. */
  onGoToFullProfile?: () => void;
};

export function UserPublicProfileModal({
  userId,
  currentUserId,
  initialFollowingIds,
  onClose,
  onFollowingChanged,
  onGoToFullProfile,
}: UserPublicProfileModalProps) {
  const {
    load: _load,
    followerCount: _followerCount,
    followingCount: _followingCount,
    ...profileUi
  } = usePublicProfile({
    userId,
    currentUserId,
    initialFollowingIds,
    onFollowingChanged,
  });

  useEffect(() => {
    if (!userId) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [userId, onClose]);

  useEffect(() => {
    if (!userId || userId === currentUserId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [userId, currentUserId]);

  if (!userId || userId === currentUserId) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-[3px] sm:p-6 light:bg-zinc-900/45"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <PublicProfileBody
        variant="modal"
        {...profileUi}
        onModalClose={onClose}
        onGoToFullProfile={onGoToFullProfile}
      />
    </div>,
    document.body,
  );
}
