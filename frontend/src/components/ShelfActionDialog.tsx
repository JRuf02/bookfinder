import { useState } from "react";

type Props = {
  action: "insert" | "remove";
  onSubmit: (osmId: string) => void;
  onCancel: () => void;
};

export default function ShelfActionDialog({ action, onSubmit, onCancel }: Props) {
  const [osmId, setOsmId] = useState("");
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(osmId);
      }}
      style={{ margin: "2rem 0" }}
    >
      <h3>
        {action === "insert" ? "Insert book into bookshelf" : "Remove book from bookshelf"}
      </h3>
      <input
        type="text"
        placeholder="Enter bookshelf OSM ID"
        value={osmId}
        onChange={e => setOsmId(e.target.value)}
        required
        style={{ fontSize: "1rem", padding: "0.5rem" }}
      />
      <button type="submit" style={{ marginLeft: "1rem" }}>
        Confirm
      </button>
      <button type="button" style={{ marginLeft: "1rem" }} onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}