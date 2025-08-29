
import ResultDetail from "@/components/ResultDetail";

type Props = { params: { resultId: string } };

export default function Page({ params }: Props) {
  const { resultId } = params;

  return (
    <div className="container mx-auto p-4">
      <ResultDetail resultId={resultId} />
    </div>
  );
}
