const express = require("express");
const app = express();
app.use(express.json());

const seedData = [
  {
    id: 1,
    language: "Python",
    code: "print('Hello, World!')",
  },
  {
    id: 2,
    language: "Python",
    code: "def add(a, b):\n    return a + b",
  },
  {
    id: 3,
    language: "Python",
    code: "class Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    def area(self):\n        return 3.14 * self.radius ** 2",
  },
  {
    id: 4,
    language: "JavaScript",
    code: "console.log('Hello, World!');",
  },
  {
    id: 5,
    language: "JavaScript",
    code: "function multiply(a, b) {\n    return a * b;\n}",
  },
  {
    id: 6,
    language: "JavaScript",
    code: "const square = num => num * num;",
  },
  {
    id: 7,
    language: "Java",
    code: 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  },
  {
    id: 8,
    language: "Java",
    code: "public class Rectangle {\n    private int width;\n    private int height;\n\n    public Rectangle(int width, int height) {\n        this.width = width;\n        this.height = height;\n    }\n\n    public int getArea() {\n        return width * height;\n    }\n}",
  },
];

app.get("/snippets", (req, res) => {
  const language = req.query.lang;
  if (language) {
    const snippets = seedData.filter(
      (snippet) => snippet.language === language
    );
    if (snippets.length === 0) {
      res.status(404).send({ error: "No snippets found" });
    }
    res.status(200).send(snippets);
  } else {
    res.status(200).send(seedData);
  }
});

app.get("/snippets/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const snippet = seedData.find((snippet) => snippet.id === id);

  if (snippet) {
    res.status(200).send(snippet);
  } else {
    res.status(404).send({ error: "Snippet not found" });
  }
});

app.post("/snippets", (req, res) => {
  const snippet = req.body;
  seedData.push(snippet);
  res.status(201).send(snippet);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
