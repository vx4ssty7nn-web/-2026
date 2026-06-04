"use client";

type ComposerState = {
  title: string;
  content: string;
  category: string;
};

type BoardComposerProps = {
  canPost: boolean;
  currentUserName: string;
  newBoard: ComposerState;
  onChange: (next: ComposerState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function BoardComposer({ canPost, currentUserName, newBoard, onChange, onSubmit }: BoardComposerProps) {
  return (
    <section className="panel">
      <h2>新規投稿</h2>
      <form className="board-form" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="タイトル"
          value={newBoard.title}
          disabled={!canPost}
          onChange={(event) => onChange({ ...newBoard, title: event.target.value })}
        />
        <textarea
          placeholder="内容"
          rows={4}
          value={newBoard.content}
          disabled={!canPost}
          onChange={(event) => onChange({ ...newBoard, content: event.target.value })}
        />
        <div className="inline-fields">
          <input type="text" value={currentUserName} disabled />
          <select
            value={newBoard.category}
            disabled={!canPost}
            onChange={(event) => onChange({ ...newBoard, category: event.target.value })}
          >
            <option value="一般">一般</option>
            <option value="お知らせ">お知らせ</option>
            <option value="質問">質問</option>
            <option value="要望">要望</option>
            <option value="雑談">雑談</option>
          </select>
        </div>
        <button type="submit" disabled={!canPost}>
          新規投稿
        </button>
      </form>
    </section>
  );
}
