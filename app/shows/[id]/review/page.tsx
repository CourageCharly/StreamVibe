import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReviewWriteView from "@/components/ReviewWriteView";
import { fetchShowDetails } from "@/lib/api";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const show = await fetchShowDetails(Number(id));
  return {
    title: show?.title ? `Review ${show.title}` : "Add Your Review",
  };
}

export default async function ShowReviewPage({ params }: Props) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const show = await fetchShowDetails(id);
  if (!show) notFound();

  return (
    <ReviewWriteView
      mediaId={show.id}
      mediaType="tv"
      title={show.title}
      backHref={`/shows/${show.id}`}
    />
  );
}
