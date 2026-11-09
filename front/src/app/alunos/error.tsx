"use client";

export default function StudentsError() {
  return (
    <section className="panel state" role="alert">
      <p className="eyebrow">Falha na consulta</p>
      <h1>Não foi possível carregar os dados</h1>
      <p>Não foi possível consultar o banco de dados. Tente novamente.</p>
      {/* Uma nova navegação ao servidor repete a consulta no banco. */}
      <button
        className="button"
        onClick={() => {
          window.location.reload();
        }}
      >
        Tentar novamente
      </button>
    </section>
  );
}
