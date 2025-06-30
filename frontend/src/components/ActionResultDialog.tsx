type Props = {
  message: string;
};

export default function ActionResultDialog({ message }: Props) {
  return (
    <div style={{ marginTop: "1rem", fontWeight: "bold" }}>
      {message}
    </div>
  );
}