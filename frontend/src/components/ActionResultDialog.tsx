import styles from "../styles/ActionResultDialog.module.css";

type Props = {
  message: string;
};

export default function ActionResultDialog({ message }: Props) {
  return <div className={styles.actionResult}>{message}</div>;
}
