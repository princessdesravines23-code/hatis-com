import Nav from "../components/Nav";

interface Props {
  title: string;
  body: string;
}

export default function LegalPage({ title, body }: Props) {
  return (
    <>
      <Nav />
      <div className="max-w-[680px] mx-auto px-6 py-16">
        <h1 className="text-[clamp(28px,4vw,38px)] mb-6">{title}</h1>
        <p className="text-[15px] text-ink-soft leading-relaxed">{body}</p>
      </div>
    </>
  );
}