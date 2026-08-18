type Props = {
  title?: string;
  message: string;
};

export default function EmptyCatalog({
  title = "No Movies/Shows found",
  message,
}: Props) {
  return (
    <div className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-xl border border-[#262626] bg-[#0F0F0F] px-6 py-16 text-center">
      <p className="text-[16px] font-medium text-white sm:text-[18px]">{title}</p>
      <p className="mt-2 text-[14px] text-[#999999] sm:text-[16px]">{message}</p>
    </div>
  );
}
