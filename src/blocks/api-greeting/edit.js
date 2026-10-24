import { useBlockProps } from "@wordpress/block-editor";
import { TextControl, Button } from "@wordpress/components";
import { useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";

export default function Edit({ attributes, setAttributes }) {
  const { name } = attributes;
  const blockProps = useBlockProps();

  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trimmedName = name.trim();

  const validationError =
    trimmedName.length < 2
      ? "Imię musi mieć co najmniej 2 znaki."
      : trimmedName.length > 30
        ? "Imię może mieć maksymalnie 30 znaków."
        : "";

  async function fetchGreeting() {
    if (validationError || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setGreeting("");

    try {
      const data = await apiFetch({
        path: "/fse-theme/v1/status?name=" + encodeURIComponent(trimmedName),
      });

      setGreeting(data.hello);
    } catch (err) {
      setError(err.message || "Błąd pobierania danych.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div {...blockProps}>
      <h3>API Greeting</h3>

      <TextControl
        label="Twoje imię"
        value={name}
        onChange={(value) => {
          setAttributes({ name: value });
          setGreeting("");
          setError("");
        }}
        help={validationError || "Wpisz od 2 do 30 znaków."}
      />

      <Button
        variant="primary"
        onClick={fetchGreeting}
        disabled={Boolean(validationError) || loading}
      >
        {loading ? "Pobieranie..." : "Pobierz powitanie"}
      </Button>

      {greeting && <p>{greeting}</p>}

      {error && <p role="alert">{error}</p>}
    </div>
  );
}
