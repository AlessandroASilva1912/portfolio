# Cadastro de cursos e certificados

Edite `js/course-data.js`. Cada objeto representa um curso e alimenta a página inicial e a aba de certificações. A página inicial mantém os indicadores de experiência e foco profissional. As duas métricas de formação incluem também os totais em andamento.

| Campo | Conteúdo |
| --- | --- |
| `name`, `platform` | Nome oficial do curso e da instituição |
| `status` | `completed` para concluído ou `in-progress` para em andamento |
| `category` | `qa`, `development`, `data` ou `infrastructure`; concluídos sem categoria entram em Outros cursos |
| `hours` | Carga horária total numérica. Omita quando desconhecida |
| `skills` | Lista opcional de competências reais |
| `start`, `expectedEnd`, `completedAt` | Datas opcionais no formato AAAA-MM ou AAAA-MM-DD |
| `progress` | Percentual real entre 0 e 100 para cursos em andamento. Omita se desconhecido |
| `url` | Endereço HTTP(S) oficial da plataforma ou do curso |
| `featured` | Use `true` para destacar o curso |
| `certificate` | Arquivo local ou link oficial de validação do curso concluído |

Para registrar um curso em andamento, acrescente um objeto com os dados disponíveis e use `status: "in-progress"`. Para concluir o curso, altere o status para `completed`, revise a categoria e acrescente a data real de conclusão, se conhecida. As horas em andamento representam a carga total dos cursos em andamento. Somente horas informadas entram nas somas.

Para habilitar **Visualizar certificado**, coloque o documento real nesta pasta e acrescente `certificate: { file: "doc/certificados/NOME-DO-ARQUIVO.pdf" }` ao curso correspondente, substituindo o nome pelo arquivo real. Os formatos aceitos são PDF, PNG, JPG e JPEG. Respeite as maiúsculas e minúsculas no caminho para o GitHub Pages. O site confere a disponibilidade do arquivo local antes de exibir o botão. O servidor deve responder à consulta HEAD com o tipo MIME correto (application/pdf, image/png ou image/jpeg). Para verificar PDFs localmente, sirva o portfólio por HTTP (por exemplo, execute `python -m http.server` na raiz do projeto). O navegador pode bloquear a consulta a arquivos PDF pela origem file://.

Para uma validação externa, configure `certificate: { url: "ENDEREÇO-OFICIAL" }` com o endereço HTTP(S) fornecido pela instituição. Confirme o destino no navegador. O link abre em outra aba. Plataformas externas podem impedir que o site confirme a disponibilidade automaticamente. Deixe esse campo ausente quando não existir certificado.

Acrescente as traduções de títulos e competências novos ao dicionário `js/translations.js`. O texto original em português é a chave. Instituições e tecnologias podem conservar a grafia original.
