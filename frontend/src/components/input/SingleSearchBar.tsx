import { FormEvent, useState } from "react";

import TextInput from "../TextInput";

type SingleSearchBarProps = {
  onSubmit: (searchTerm: string) => void;
};

/**
 * Text input field for searching books by title, author, or ISBN.
 * Calls onSubmit() with the current search term when the form is submitted.
 */
export default function SingleSearchBar({ onSubmit }: SingleSearchBarProps) {
  const [value, setValue] = useState("");
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const searchTerm = value.trim();
    if (searchTerm) onSubmit(searchTerm);
  };
  return (
    <TextInput
      value={value}
      placeholder="Search book by title, author, or ISBN"
      label="Search book by title, author, or ISBN"
      onChange={(e) => setValue(e.target.value)}
      onSubmit={handleSubmit}
    />
  );
}
