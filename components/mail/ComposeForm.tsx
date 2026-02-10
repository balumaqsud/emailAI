import { FormEvent, useState } from "react";
import type { SendMailInput } from "@/src/lib/mail/types";
import styles from "@/styles/Compose.module.css";

export interface ComposeFormProps {
  onSubmit: (input: SendMailInput) => Promise<void> | void;
  submitting?: boolean;
  error?: string | null;
}

export function ComposeForm({
  onSubmit,
  submitting = false,
  error,
}: ComposeFormProps) {
  const [toNickname, setToNickname] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const payload: SendMailInput = {
      toNickname: toNickname.trim(),
      subject: subject.trim() === "" ? undefined : subject,
      bodyText,
    };

    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="to">
          To (nickname)
        </label>
        <input
          id="to"
          className={styles.input}
          type="text"
          required
          value={toNickname}
          onChange={(e) => setToNickname(e.target.value)}
          placeholder="e.g. johndoe"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="subject">
          Subject
        </label>
        <input
          id="subject"
          className={styles.input}
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Optional subject"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="body">
          Message
        </label>
        <textarea
          id="body"
          className={styles.textarea}
          required
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder="Write your message..."
        />
      </div>

      <div className={styles.actions}>
        <button
          type="submit"
          className={styles.primaryButton}
          disabled={submitting}
        >
          {submitting ? "Sending..." : "Send"}
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </form>
  );
}

