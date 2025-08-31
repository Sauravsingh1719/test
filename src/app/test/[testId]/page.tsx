import StudentTestTake from "@/components/student/TestTake";

type Props = { params: { testId: string } };

export default function Page({ params }: Props) {
  return (
    <div className="container mx-auto p-4 py-[10%]">
      <StudentTestTake testId={params.testId} />
    </div>
  );
}
