"use client";

import type { Board } from "@/types/board";

type EditValues = {
  title: string;
  content: string;
  category: string;
};

type BoardListProps = {
  boards: Board[];
  isLoading: boolean;
  canPost: boolean;
  replyInputs: Record<string, string>;
  editingBoardId: string | null;
  editingValues: EditValues;
  errorMessage: string;
  onReplyInputChange: (boardId: string, value: string) => void;
  onReplySubmit: (boardId: string, event: React.FormEvent<HTMLFormElement>) => void;
  onTogglePin: (board: Board) => void;
  onStartEdit: (board: Board) => void;
  onSaveEdit: (boardId: string) => void;
  onCancelEdit: () => void;
  onDelete: (boardId: string) => void;
  onEditChange: (next: EditValues) => void;
};

function cardLengthClass(board: Board): string {
  const total = board.title.length + board.content.length;
  if (total > 220) return "board-card--long";
  if (total > 90) return "board-card--medium";
  return "board-card--short";
}

function chipClass(category: string): string {
  switch (category) {
    case "質問":
      return "chip chip--question";
    case "要望":
      return "chip chip--request";
    case "お知らせ":
      return "chip chip--notice";
    default:
      return "chip chip--default";
  }
}

function chipLabel(category: string): string {
  if (category === "質問") return "【質問】";
  return category;
}

export function BoardList({
  boards,
  isLoading,
  canPost,
  replyInputs,
  editingBoardId,
  editingValues,
  errorMessage,
  onReplyInputChange,
  onReplySubmit,
  onTogglePin,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onEditChange
}: BoardListProps) {
  return (
    <section className="panel">
      <h2>投稿一覧</h2>
      {isLoading && <p className="empty">投稿を読み込み中です...</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="board-list">
        {!isLoading &&
          boards.map((board) => (
            <article
              className={`board-card japanese-prose ${board.pinned ? "is-pinned" : ""} ${cardLengthClass(board)}`}
              key={board.id}
            >
              <div className="board-card-inner">
                <div className="board-head">
                  <span className={chipClass(board.category)}>{chipLabel(board.category)}</span>
                  <div className="actions">
                    <>
                      <button type="button" onClick={() => onTogglePin(board)} className="pin-btn">
                        {board.pinned ? "ピン留め解除" : "ピン留め"}
                      </button>
                      <button type="button" className="edit-btn" onClick={() => onStartEdit(board)}>
                        編集
                      </button>
                      <button type="button" className="delete-btn" onClick={() => onDelete(board.id)}>
                        削除
                      </button>
                    </>
                  </div>
                </div>
                {editingBoardId === board.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editingValues.title}
                      onChange={(event) => onEditChange({ ...editingValues, title: event.target.value })}
                    />
                    <textarea
                      rows={3}
                      value={editingValues.content}
                      onChange={(event) => onEditChange({ ...editingValues, content: event.target.value })}
                    />
                    <div className="actions">
                      <select
                        value={editingValues.category}
                        onChange={(event) => onEditChange({ ...editingValues, category: event.target.value })}
                      >
                        <option value="一般">一般</option>
                        <option value="お知らせ">お知らせ</option>
                        <option value="質問">質問</option>
                        <option value="要望">要望</option>
                        <option value="雑談">雑談</option>
                      </select>
                      <button type="button" onClick={() => onSaveEdit(board.id)}>
                        保存
                      </button>
                      <button type="button" className="secondary-btn" onClick={onCancelEdit}>
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="board-card-title">{board.title}</h3>
                    <p className="board-card-text">{board.content}</p>
                  </>
                )}
                <p className="meta board-card-meta">
                  投稿者: {board.author} / {board.createdAt}
                </p>

                <div className="replies">
                  <h4>返信 ({board.replies.length})</h4>
                  {board.replies.length === 0 && <p className="empty">まだ返信はありません。</p>}
                  {board.replies.map((reply) => (
                    <div className="reply-item japanese-prose" key={reply.id}>
                      <p className="reply-text">{reply.message}</p>
                      <p className="meta reply-meta">
                        {reply.author} / {reply.createdAt}
                      </p>
                    </div>
                  ))}
                  <form className="reply-form" onSubmit={(event) => onReplySubmit(board.id, event)}>
                    <input
                      type="text"
                      placeholder="返信を書く"
                      value={replyInputs[board.id] ?? ""}
                      disabled={!canPost}
                      onChange={(event) => onReplyInputChange(board.id, event.target.value)}
                    />
                    <button type="submit" className="reply-answer-btn" disabled={!canPost}>
                      【回答】
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        {!isLoading && boards.length === 0 && <p className="empty">投稿がまだありません。</p>}
      </div>
    </section>
  );
}
