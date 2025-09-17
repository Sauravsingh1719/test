import StudentTestTake from "@/components/student/TestTake";

type Props = { params: { testId: string } };

export default function Page({ params }: Props) {
  return <StudentTestTake testId={params.testId} />;
}