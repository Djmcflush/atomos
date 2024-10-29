import { NextRequest, NextResponse } from 'next/server';
import { query, initDb } from '../db';

export async function GET(request: NextRequest) {
  await initDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  let result;
  if (id) {
    result = await query('SELECT * FROM Atomics WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Atom not found' }, { status: 404 });
    }
  } else {
    result = await query('SELECT * FROM Atomics ORDER BY id DESC LIMIT 1');
  }

  return NextResponse.json(result.rows[0]);
}

export async function POST(request: NextRequest) {
  const { protons, neutrons, electrons } = await request.json();
  const result = await query(
    'INSERT INTO Atomics (protons, neutrons, electrons) VALUES ($1, $2, $3) RETURNING id',
    [protons, neutrons, electrons]
  );
  return NextResponse.json({ id: result.rows[0].id });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const { protons, neutrons, electrons } = await request.json();
  const result = await query(
    'UPDATE Atomics SET protons = $1, neutrons = $2, electrons = $3 WHERE id = $4 RETURNING *',
    [protons, neutrons, electrons, id]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Atom not found' }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}
