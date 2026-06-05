type SearchOption = {
  label: string;
  value: string;
};

type ListSearchBarProps = {
  basePath: string;
  query?: string;
  field?: string;
  options: SearchOption[];
};

export function ListSearchBar({
  basePath,
  query = "",
  field = "all",
  options,
}: ListSearchBarProps) {
  return (
    <form
      action={basePath}
      method="GET"
      className="mb-4 flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:flex-row md:items-center"
    >
      <input
        className="input md:flex-1"
        name="q"
        defaultValue={query}
        placeholder="검색어를 입력하세요."
      />

      <select
        className="input md:w-40"
        name="field"
        defaultValue={field || "all"}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <input type="hidden" name="page" value="1" />

      <button className="btn btn-primary" type="submit">
        검색
      </button>

      <a className="btn btn-secondary" href={basePath}>
        검색초기화
      </a>
    </form>
  );
}
