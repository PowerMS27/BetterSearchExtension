<!-- <script setup>
const onSearch = async (searchTerm) => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: highlightText,
        args: [searchTerm]
    });
}

// Основная функция для поиска и выделения текста
function highlightText(searchTerm) {
  removeHighlights(); // Удаляем старые выделения перед новым поиском

  if (!searchTerm) {
    return;
  }

  const lowerSearchTerm = searchTerm.toLowerCase();
  const textNodes = getTextNodes(document.body); // Получаем текстовые узлы без выделений
  const ranges = getHighlightRanges(textNodes, lowerSearchTerm);

  // Применяем новые выделения
  ranges.forEach((range) => {
    try {
      wrapRangeInHighlight(range);
    } catch (e) {
      console.error("Failed to create valid range:", e);
    }
  });
}

// Функция для получения текстовых узлов, исключая уже выделенные
function getTextNodes(node) {
  const textNodes = [];
  const walker = document.createTreeWalker(
    node,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Пропускаем текстовые узлы внутри элементов с классом better-search-highlight
        if (
          node.parentNode &&
          node.parentNode.classList.contains("better-search-highlight")
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    },
    false
  );

  let currentNode;

  while ((currentNode = walker.nextNode())) {
    if (currentNode.nodeValue.trim() !== "") {
      textNodes.push(currentNode);
    }
  }

  return textNodes;
}


// Функция для поиска диапазонов текста
function getHighlightRanges(textNodes, searchTerm) {
  const ranges = [];
  const lowerSearchTerm = searchTerm.toLowerCase();
  let concatenatedText = '';
  let nodeMap = [];
  
  // Шаг 1: Объединяем текст всех узлов в одну строку
  textNodes.forEach((node, index) => {
    concatenatedText += node.textContent.toLowerCase();
    nodeMap.push({ node, index });
  });

  // Шаг 2: Ищем все вхождения строки поиска в объединённом тексте
  let startIndex = 0;
  while (startIndex < concatenatedText.length) {
    let matchIndex = concatenatedText.indexOf(lowerSearchTerm, startIndex);

    if (matchIndex === -1) {
      break;
    }

    let matchEndIndex = matchIndex + lowerSearchTerm.length;

    // Шаг 3: Находим, в каких узлах находятся найденные совпадения
    let remainingLength = lowerSearchTerm.length;
    let currentMatchIndex = matchIndex;

    nodeMap.forEach(({ node }) => {
      const nodeText = node.textContent.toLowerCase();
      const nodeLength = nodeText.length;

      if (currentMatchIndex < nodeLength && remainingLength > 0) {
        // Создаем диапазон для выделения в пределах текущего узла
        const range = document.createRange();
        const start = Math.max(0, currentMatchIndex);
        const end = Math.min(nodeLength, currentMatchIndex + remainingLength);

        range.setStart(node, start);
        range.setEnd(node, end);
        ranges.push(range);

        remainingLength -= (end - start);
        currentMatchIndex = 0;
      } else {
        currentMatchIndex -= nodeLength;
      }
    });

    // Шаг 4: Обновляем индекс для дальнейшего поиска
    startIndex = matchIndex + lowerSearchTerm.length;
  }

  return ranges;
}

// Функция для оборачивания диапазона текста в элемент span
function wrapRangeInHighlight(range) {
  const highlightSpan = document.createElement("span");
  highlightSpan.className = "better-search-highlight";

  const fragment = range.extractContents();
  highlightSpan.appendChild(fragment);
  range.insertNode(highlightSpan);
  highlightSpan.normalize(); // Объединяет текстовые узлы после вставки
}

// Функция для удаления предыдущих выделений и объединения текстовых узлов
function removeHighlights() {
  const highlights = document.querySelectorAll("span.better-search-highlight");
  highlights.forEach((highlight) => {
    const parent = highlight.parentNode;
    if (parent) {
      parent.replaceChild(
        document.createTextNode(highlight.textContent),
        highlight
      );
      parent.normalize(); // Объединяет текстовые узлы после удаления
    }
  });
}
</script>

<template>
  <div>
    <input type="text" @input="event => onSearch(event.target.value)" placeholder="Введите текст для поиска">
  </div>
</template>

<style>

</style> -->

<script setup>
/**
 * ! при поиске по "out create-vue," и дальнейшем стирании по одному символу,
 * ! ссылка будет размножаться на отдельные символы
 */

const onSearch = async (searchTerm) => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (searchTerm) => {
      function highlightText(searchTerm) {
        removeHighlights();

        if (!searchTerm) {
          return;
        }

        const lowerSearchTerm = searchTerm.toLowerCase();
        const textNodes = getTextNodes(document.body);
        const ranges = getHighlightRanges(textNodes, lowerSearchTerm);

        ranges.forEach((range) => {
          try {
            wrapRangeInHighlight(range);
          } catch (e) {
            console.error("Failed to create valid range:", e);
          }
        });
      }

      highlightText(searchTerm);

      function getTextNodes(node) {
        const textNodes = [];
        const walker = document.createTreeWalker(
          node,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        let currentNode;

        while ((currentNode = walker.nextNode())) {
          if (currentNode.nodeValue.trim() !== "") {
            textNodes.push(currentNode);
          }
        }

        return textNodes;
      }

      function getHighlightRanges(textNodes, searchTerm) {
        const ranges = [];
        let fullText = "";
        const nodesInfo = [];

        // Сборка полной строки текста из всех текстовых узлов
        textNodes.forEach((node) => {
          nodesInfo.push({
            node: node,
            start: fullText.length,
          });
          fullText += node.textContent;
        });

        const lowerFullText = fullText.toLowerCase();
        let index = 0;

        // Поиск терма в полной строке текста
        while ((index = lowerFullText.indexOf(searchTerm, index)) !== -1) {
          const endIndex = index + searchTerm.length;
          const startNodeInfo = nodesInfo.find(
            (info) =>
              info.start <= index &&
              index < info.start + info.node.textContent.length
          );
          const endNodeInfo = nodesInfo.find(
            (info) =>
              info.start < endIndex &&
              endIndex <= info.start + info.node.textContent.length
          );

          if (startNodeInfo && endNodeInfo) {
            const range = document.createRange();
            const startOffset = index - startNodeInfo.start;
            const endOffset = endIndex - endNodeInfo.start;

            try {
              range.setStart(startNodeInfo.node, startOffset);
              range.setEnd(endNodeInfo.node, endOffset);
              ranges.push(range);
            } catch (e) {
              console.error("Failed to create valid range:", e);
            }
          }
          index = endIndex;
        }

        return ranges;
      }

      function wrapRangeInHighlight(range) {
        const highlightSpan = document.createElement("span");
        highlightSpan.className = "better-search-highlight";

        // Используем DocumentFragment для безопасной работы с DOM
        const fragment = range.extractContents();
        highlightSpan.appendChild(fragment);
        range.insertNode(highlightSpan);
      }

      function removeHighlights() {
        const highlights = document.querySelectorAll(
          "span.better-search-highlight"
        );

        highlights.forEach((span) => {
          const parent = span.parentNode;
          while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
          }
          parent.removeChild(span);
          parent.normalize();
        });
      }
    },
    args: [searchTerm],
  });
};

// function highlightText(searchTerm) {
//   alert(`222 ${searchTerm}`)
//   removeHighlights();

//   if (!searchTerm) {
//     return;
//   }

//   const lowerSearchTerm = searchTerm.toLowerCase();
//   const textNodes = getTextNodes(document.body);
//   const ranges = getHighlightRanges(textNodes, lowerSearchTerm);

//   ranges.forEach((range) => {
//     try {
//       wrapRangeInHighlight(range);
//     } catch (e) {
//       console.error("Failed to create valid range:", e);
//     }
//   });
// }

// function getTextNodes(node) {
//   const textNodes = [];
//   const walker = document.createTreeWalker(
//     node,
//     NodeFilter.SHOW_TEXT,
//     null,
//     false
//   );
//   let currentNode;

//   while ((currentNode = walker.nextNode())) {
//     if (currentNode.nodeValue.trim() !== "") {
//       textNodes.push(currentNode);
//     }
//   }

//   return textNodes;
// }

// function getHighlightRanges(textNodes, searchTerm) {
//   const ranges = [];
//   let fullText = "";
//   const nodesInfo = [];

//   // Сборка полной строки текста из всех текстовых узлов
//   textNodes.forEach((node) => {
//     nodesInfo.push({
//       node: node,
//       start: fullText.length,
//     });
//     fullText += node.textContent;
//   });

//   const lowerFullText = fullText.toLowerCase();
//   let index = 0;

//   // Поиск терма в полной строке текста
//   while ((index = lowerFullText.indexOf(searchTerm, index)) !== -1) {
//     const endIndex = index + searchTerm.length;
//     const startNodeInfo = nodesInfo.find(
//       (info) =>
//         info.start <= index && index < info.start + info.node.textContent.length
//     );
//     const endNodeInfo = nodesInfo.find(
//       (info) =>
//         info.start < endIndex &&
//         endIndex <= info.start + info.node.textContent.length
//     );

//     if (startNodeInfo && endNodeInfo) {
//       const range = document.createRange();
//       const startOffset = index - startNodeInfo.start;
//       const endOffset = endIndex - endNodeInfo.start;

//       try {
//         range.setStart(startNodeInfo.node, startOffset);
//         range.setEnd(endNodeInfo.node, endOffset);
//         ranges.push(range);
//       } catch (e) {
//         console.error("Failed to create valid range:", e);
//       }
//     }
//     index = endIndex;
//   }

//   return ranges;
// }

// function wrapRangeInHighlight(range) {
//   const highlightSpan = document.createElement("span");
//   highlightSpan.className = "better-search-highlight";

//   // Используем DocumentFragment для безопасной работы с DOM
//   const fragment = range.extractContents();
//   highlightSpan.appendChild(fragment);
//   range.insertNode(highlightSpan);
// }

// function removeHighlights() {
//   alert('333');
//   const highlights = document.querySelectorAll("span.better-search-highlight");

//   highlights.forEach((span) => {
//     const parent = span.parentNode;
//     while (span.firstChild) {
//       parent.insertBefore(span.firstChild, span);
//     }
//     parent.removeChild(span);
//     parent.normalize();
//   });
// }
</script>

<template>
  <div>
    <input
      type="text"
      @input="(event) => onSearch(event.target.value)"
      placeholder="SearchBar с логами"
      class="better-search-searchbar"
    />
  </div>
</template>

<style></style>
