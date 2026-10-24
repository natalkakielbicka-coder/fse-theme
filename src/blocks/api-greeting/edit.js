import { useBlockProps } from "@wordpress/block-editor";
import { TextControl, Button } from "@wordpress/components";
import { useState, useEffect, useCallback } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";

export default function Edit({ attributes, setAttributes }) {
  const { name } = attributes;
  const blockProps = useBlockProps();

  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = useCallback(
    (value) => {
      setAttributes({ name: value });
      setGreeting("");
      setError("");
    },
    [setAttributes],
  );

  const trimmedName = name.trim();

  const validationError =
    trimmedName.length < 2
      ? "Imię musi mieć co najmniej 2 znaki."
      : trimmedName.length > 30
        ? "Imię może mieć maksymalnie 30 znaków."
        : "";

  useEffect(() => {
    if (validationError) {
      setGreeting("");
      setError("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    setGreeting("");
    setError("");
    setLoading(true);

    const timer = setTimeout(() => {
      apiFetch({
        path: "/fse-theme/v1/status?name=" + encodeURIComponent(trimmedName),
        signal: controller.signal,
      })
        .then((data) => {
          if (!cancelled) {
            setGreeting(data.hello);
          }
        })
        .catch((err) => {
          if (!cancelled && err.name !== "AbortError") {
            setError(err.message || "Błąd pobierania danych.");
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedName, validationError]);

  return (
    <div {...blockProps}>
      <h3>API Greeting</h3>

      <TextControl
        label="Twoje imię"
        value={name}
        onChange={handleNameChange}
        help={validationError || "Wpisz od 2 do 30 znaków."}
      />

      {loading && <p role="status">Pobieranie...</p>}

      {!loading && greeting && <p>{greeting}</p>}

      {error && <p role="alert">{error}</p>}
    </div>
  );
}
