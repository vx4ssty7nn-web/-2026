"use client";

export function BoardComposer({ canPost, currentUserName, newBoard, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="board-composer">
      <input
        type="text"
        placeholder="タイトル"
        value={newBoard.title}
        onChange={(e) => onChange({ ...newBoard, title: e.target.value })}
      />
      <textarea
        placeholder="内容"
        value={newBoard.content}
        onChange={(e) => onChange({ ...newBoard, content: e.target.value })}
      />
      <button type="submit" disabled={!canPost}>投稿する</button>
    </form>
  );
}
