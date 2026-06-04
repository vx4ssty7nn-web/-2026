"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { Board } from "@/types/board";
import { BoardComposer } from "@/components/board/board-composer";
import { BoardList } from "@/components/board/board-list";

function getExternalApiUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("環境変数 NEXT_PUBLIC_API_URL が未設定です。");
  }
  return url;
}

export default function Home() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [boardId, setBoardId] = useState(1);
  const [boardOptions, setBoardOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [adminToken, setAdminToken] = useState<string>("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [newBoardName, setNewBoardName] = useState("");
  const [notifications, setNotifications] = useState<Array<{ id: number; boardName: string; createdAt: string }>>([]);
  const [newBoard, setNewBoard] = useState({
    title: "",
    content: "",
    category: "一般"
  });
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState({ title: "", content: "", category: "一般" });

  const currentUserId = "guest-user";
  const currentUserName = "匿名";
  const canPost = true;

  const sortedBoards = useMemo(() => {
    return [...boards].sort((a, b) => {
      if (a.pinned === b.pinned) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.pinned ? -1 : 1;
    });
  }, [boards]);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${getExternalApiUrl()}?action=posts_list&boardId=${boardId}`, {
        cache: "no-store"
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "投稿一覧を取得できませんでした。");
      }
      setBoards((data.posts ?? []) as Board[]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "投稿一覧を取得できませんでした。");
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  const loadBoardOptions = async () => {
    try {
      const response = await fetch(`${getExternalApiUrl()}?action=boards_list`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "ボード一覧を取得できませんでした。");
      }
      const boards = (data.boards ?? []) as Array<{ id: number | string; name: string }>;
      setBoardOptions(boards.map((b) => ({ id: Number(b.id), name: String(b.name) })));
    } catch {
      // ボード一覧が無くても投稿表示は継続できる
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("admin_token") ?? "";
    setAdminToken(stored);
    void loadBoardOptions();
    void loadPosts();
  }, [loadPosts]);

  const adminFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    return await fetch(input, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${adminToken}`
      }
    });
  };

  const handleAdminLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdminMessage("");
    try {
      const response = await fetch(getExternalApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_login",
          email: adminEmail.trim(),
          password: adminPassword
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "管理者ログインに失敗しました。");
      }
      const token = String(data.token ?? "");
      setAdminToken(token);
      localStorage.setItem("admin_token", token);
      setAdminEmail("");
      setAdminPassword("");
      setAdminMessage("管理者ログインしました。");
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : "管理者ログインに失敗しました。");
    }
  };

  const handleAdminLogout = () => {
    setAdminToken("");
    localStorage.removeItem("admin_token");
    setAdminMessage("管理者ログアウトしました。");
  };

  const handleCreateBoardContainer = async () => {
    if (!newBoardName.trim()) return;
    setAdminMessage("");
    try {
      const response = await adminFetch(getExternalApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "boards_create", name: newBoardName.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "ボード作成に失敗しました。");
      setNewBoardName("");
      await loadBoardOptions();
      setAdminMessage("ボードを作成しました。");
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : "ボード作成に失敗しました。");
    }
  };

  const handleDeleteBoardContainer = async () => {
    setAdminMessage("");
    try {
      const response = await adminFetch(getExternalApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "boards_delete", boardId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "ボード削除に失敗しました。");
      await loadBoardOptions();
      setBoardId(1);
      setAdminMessage("ボードを削除しました。");
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : "ボード削除に失敗しました。");
    }
  };

  const loadNotifications = async () => {
    setAdminMessage("");
    try {
      const response = await adminFetch(`${getExternalApiUrl()}?action=admin_notifications`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "通知の取得に失敗しました。");
      setNotifications(
        ((data.notifications ?? []) as Array<{ id: number | string; boardName: string; createdAt: string }>).map((n) => ({
          id: Number(n.id),
          boardName: String(n.boardName ?? ""),
          createdAt: String(n.createdAt ?? "")
        }))
      );
      setAdminMessage("通知を更新しました。");
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : "通知の取得に失敗しました。");
    }
  };

  const handleCreateBoard = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newBoard.title.trim() || !newBoard.content.trim()) {
      return;
    }
    try {
      setErrorMessage("");
      const response = await fetch(getExternalApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "posts_create",
          boardId,
          title: newBoard.title.trim(),
          content: newBoard.content.trim(),
          category: newBoard.category,
          author: currentUserName,
          ownerId: currentUserId
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "投稿の作成に失敗しました。");
      }
      setBoards((prev) => [data.post as Board, ...prev]);
      setNewBoard({ title: "", content: "", category: "一般" });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "投稿の作成に失敗しました。");
    }
  };

  const updateBoard = async (boardId: string, payload: Partial<Board>) => {
    const response = await fetch(getExternalApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "posts_update",
        id: Number(boardId),
        title: payload.title,
        content: payload.content,
        category: payload.category,
        pinned: payload.pinned
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message ?? "投稿の更新に失敗しました。");
    await loadPosts();
    return data as Board;
  };

  const togglePin = async (board: Board) => {
    try {
      setErrorMessage("");
      const updated = await updateBoard(board.id, { pinned: !board.pinned });
      setBoards((prev) => prev.map((item) => (item.id === board.id ? updated : item)));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "ピン留めの更新に失敗しました。");
    }
  };

  const handleReplySubmit = async (boardId: string, e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = replyInputs[boardId]?.trim();
    if (!value) {
      return;
    }
    try {
      setErrorMessage("");
      const response = await fetch(`/api/boards/${boardId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "返信の保存に失敗しました。");
      }
      setBoards((prev) => prev.map((board) => (board.id === boardId ? (data as Board) : board)));
      setReplyInputs((prev) => ({ ...prev, [boardId]: "" }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "返信の保存に失敗しました。");
    }
  };

  const startEdit = (board: Board) => {
    setEditingBoardId(board.id);
    setEditingValues({
      title: board.title,
      content: board.content,
      category: board.category
    });
  };

  const saveEdit = async (id: string) => {
    if (!editingValues.title.trim() || !editingValues.content.trim()) {
      return;
    }
    try {
      setErrorMessage("");
      const updated = await updateBoard(id, {
        title: editingValues.title.trim(),
        content: editingValues.content.trim(),
        category: editingValues.category
      });
      setBoards((prev) => prev.map((board) => (board.id === id ? updated : board)));
      setEditingBoardId(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "投稿の更新に失敗しました。");
    }
  };

  const deleteBoard = async (id: string) => {
    try {
      setErrorMessage("");
      const response = await fetch(getExternalApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "posts_delete", id: Number(id) })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "投稿の削除に失敗しました。");
      }
      setBoards((prev) => prev.filter((board) => board.id !== id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "投稿の削除に失敗しました。");
    }
  };

  return (
    <main className="container">
      <header className="hero">
        <div>
          <p className="eyebrow">Community Board Application</p>
          <h1>コミュニティ掲示板</h1>
          <p className="subtitle">新しいボードを作成し、重要投稿をピン留めし、返信でやり取りできます。</p>
          <div className="top-controls">
            <select value={boardId} onChange={(e) => setBoardId(Number(e.target.value))}>
              {(boardOptions.length ? boardOptions : [{ id: 1, name: "メインボード" }]).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="admin-panel">
          {adminToken ? (
            <>
              <p className="meta">管理者ログイン中</p>
              <div className="actions">
                <input
                  type="text"
                  placeholder="新しいボード名"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                />
                <button type="button" onClick={() => void handleCreateBoardContainer()}>
                  ボード作成
                </button>
                <button type="button" className="delete-btn" onClick={() => void handleDeleteBoardContainer()}>
                  ボード削除
                </button>
                <button type="button" className="secondary-btn" onClick={() => void loadNotifications()}>
                  通知更新
                </button>
                <button type="button" className="secondary-btn" onClick={handleAdminLogout}>
                  管理者ログアウト
                </button>
              </div>
              {adminMessage && <p className="meta">{adminMessage}</p>}
              {notifications.length > 0 && (
                <div className="admin-notifications">
                  {notifications.slice(0, 5).map((n) => (
                    <p className="meta" key={n.id}>
                      新規投稿: {n.boardName} / {n.createdAt}
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form className="auth-form" onSubmit={handleAdminLogin}>
              <input
                type="email"
                placeholder="管理者メール"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="管理者パスワード"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              <button type="submit">管理者ログイン</button>
              {adminMessage && <p className="meta">{adminMessage}</p>}
            </form>
          )}
        </div>
      </header>

      <BoardComposer
        canPost={canPost}
        currentUserName={currentUserName}
        newBoard={newBoard}
        onChange={setNewBoard}
        onSubmit={handleCreateBoard}
      />

      <BoardList
        boards={sortedBoards}
        isLoading={isLoading}
        canPost={canPost}
        replyInputs={replyInputs}
        editingBoardId={editingBoardId}
        editingValues={editingValues}
        errorMessage={errorMessage}
        onReplyInputChange={(boardId, value) => setReplyInputs((prev) => ({ ...prev, [boardId]: value }))}
        onReplySubmit={handleReplySubmit}
        onTogglePin={(board) => void togglePin(board)}
        onStartEdit={startEdit}
        onSaveEdit={(boardId) => void saveEdit(boardId)}
        onCancelEdit={() => setEditingBoardId(null)}
        onDelete={(boardId) => void deleteBoard(boardId)}
        onEditChange={setEditingValues}
      />
    </main>
  );
}
