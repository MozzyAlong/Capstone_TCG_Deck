'use client';
import { useParams } from 'next/navigation';

export default function DeckPageClient() {
  const params = useParams(); // returns { deckId: '...' }
  const deckId = params?.deckId;

  return <div>Deck ID: {deckId}</div>;
}