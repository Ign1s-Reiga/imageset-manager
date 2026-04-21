import { PromiseURLSearchParams } from "@/util/suspense";

export default async function Author({ searchParams }: {
  searchParams: PromiseURLSearchParams;
}) {
  const { id } = await searchParams;

  return (
    <>
      <title>Author Page</title>
    </>
  );
}
