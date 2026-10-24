import { useBlockProps } from "@wordpress/block-editor";
import { TextControl, Button } from "@wordpress/components";
import { useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";

export default function Edit() {
  const blockProps = useBlockProps();

  const [name, setName] = useState("Natalia");
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchGreeting() {
    setLoading(true);
    setError("");
    setGreeting("");

    try {
      const data = await apiFetch({
        path: "/fse-theme/v1/status?name=" + encodeURIComponent(name),
      });

      setGreeting(data.hello);
    } catch (err) {
      setError(err.message || "Nie udało się pobrać danych.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div {...blockProps}>
      <h3>API Greeting</h3>

      <TextControl label="Twoje imię" value={name} onChange={setName} />

      <Button variant="primary" onClick={fetchGreeting} disabled={loading}>
        {loading ? "Pobieranie..." : "Pobierz powitanie"}
      </Button>

      {greeting && <p>{greeting}</p>}

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}
    </div>
  );
}
