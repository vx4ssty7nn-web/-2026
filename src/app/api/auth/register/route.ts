import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!name || !email || !password) {
      return NextResponse.json({ message: "名前・メールアドレス・パスワードは必須です。" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: "パスワードは8文字以上で入力してください。" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "このメールアドレスは既に登録されています。" }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      }
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "ユーザー登録に失敗しました。",
        detail: error instanceof Error ? error.message : "不明なエラー"
      },
      { status: 500 }
    );
  }
}
