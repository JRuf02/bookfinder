type Props = {
  message: string;
};

export default function ActionResultDialog({ message }: Props) {
  return <div className="action-result">{message}</div>;
}
