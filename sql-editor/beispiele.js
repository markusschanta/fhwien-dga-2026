// Beispiel-Abfragen für das Auswahlmenü des SQL-Editors (aus den Folien zu Einheit 2).
// gruppe = Überschrift im Menü, titel = Eintrag, sql = Abfrage.
window.DGA_BEISPIELE = [
  { gruppe: 'SELECT', titel: 'Eine Spalte auswählen', sql: 'SELECT CustomerName\nFROM Customers' },
  { gruppe: 'SELECT', titel: 'Alle Spalten auswählen', sql: 'SELECT *\nFROM Customers' },
  { gruppe: 'SELECT', titel: 'Beispiel 1: Ansprechpersonen', sql: 'SELECT ContactName\nFROM Customers' },
  { gruppe: 'SELECT', titel: 'Beispiel 2: Postleitzahl und Stadt', sql: 'SELECT PostalCode, City\nFROM Customers' },

  { gruppe: 'WHERE', titel: 'Beispiel 1: Produkte über 50', sql: 'SELECT ProductName, Price\nFROM Products\nWHERE Price > 50' },
  { gruppe: 'WHERE', titel: 'Beispiel 2: Preis zwischen 10 und 13 (BETWEEN)', sql: 'SELECT ProductName\nFROM Products\nWHERE Price BETWEEN 10 AND 13' },
  { gruppe: 'WHERE', titel: 'Beispiel 2: alternativ mit >= und <=', sql: 'SELECT ProductName\nFROM Products\nWHERE Price >= 10 AND Price <= 13' },
  { gruppe: 'WHERE', titel: 'Beispiel 3: Kunden aus Deutschland', sql: "SELECT *\nFROM Customers\nWHERE Country = 'Germany'" },
  { gruppe: 'WHERE', titel: 'OR: Kunden aus Deutschland oder Österreich', sql: "SELECT CustomerName, City, Country\nFROM Customers\nWHERE Country = 'Germany' OR Country = 'Austria'" },
  { gruppe: 'WHERE', titel: 'Beispiel 4: Länder auf „land“ (LIKE)', sql: "SELECT *\nFROM Customers\nWHERE Country LIKE '%land'" },
  { gruppe: 'WHERE', titel: 'Beispiel 5: vierstellige Postleitzahl', sql: "SELECT *\nFROM Customers\nWHERE PostalCode LIKE '____'" },

  { gruppe: 'ORDER BY', titel: 'Beispiel 1: Produkte nach Preis', sql: 'SELECT *\nFROM Products\nORDER BY Price ASC' },
  { gruppe: 'ORDER BY', titel: 'Beispiel 2: die 5 teuersten Produkte (TOP)', sql: 'SELECT TOP 5 ProductName, Price\nFROM Products\nORDER BY Price DESC' },
  { gruppe: 'ORDER BY', titel: 'Rückblick: SELECT, WHERE und ORDER BY', sql: 'SELECT ProductName, Price\nFROM Products\nWHERE Price > 20\nORDER BY Price DESC' },

  { gruppe: 'DISTINCT', titel: 'Beispiel 1: Länder der Kunden', sql: 'SELECT DISTINCT Country\nFROM Customers' },
  { gruppe: 'DISTINCT', titel: 'Beispiel 2: Kunden mit mindestens einer Bestellung', sql: 'SELECT DISTINCT CustomerID\nFROM Orders' },

  { gruppe: 'GROUP BY', titel: 'Anzahl aller Kunden (COUNT)', sql: 'SELECT COUNT(*)\nFROM Customers' },
  { gruppe: 'GROUP BY', titel: 'Prinzip: Kunden pro Land in DACH', sql: "SELECT Country, COUNT(*) AS Kunden\nFROM Customers\nWHERE Country IN ('Austria', 'Germany', 'Switzerland')\nGROUP BY Country" },
  { gruppe: 'GROUP BY', titel: 'Beispiel 1: Kunden pro Land', sql: 'SELECT Country, COUNT(*) AS Kunden\nFROM Customers\nGROUP BY Country\nORDER BY Kunden DESC' },
  { gruppe: 'GROUP BY', titel: 'Beispiel 2: Durchschnittspreis pro Kategorie', sql: 'SELECT CategoryID, AVG(Price) AS Durchschnittspreis\nFROM Products\nGROUP BY CategoryID' },
  { gruppe: 'GROUP BY', titel: 'HAVING: Länder mit mindestens 10 Kunden', sql: 'SELECT Country, COUNT(*) AS Kunden\nFROM Customers\nGROUP BY Country\nHAVING COUNT(*) >= 10' },
  { gruppe: 'GROUP BY', titel: 'Kampagnen: Conversion-Rate pro Kampagne', sql: 'SELECT Kampagne,\n  SUM(Conversions) * 100.0 / SUM(Kontakte) AS Quote\nFROM Kampagnen\nGROUP BY Kampagne' },

  { gruppe: 'JOIN', titel: 'Beispiel 1: Produkte mit Kategoriename', sql: 'SELECT p.ProductName, c.CategoryName\nFROM Products p\nJOIN Categories c\n  ON p.CategoryID = c.CategoryID' },
  { gruppe: 'JOIN', titel: 'Beispiel 2: Produkte der Kategorie Produce', sql: "SELECT p.ProductName, p.Price\nFROM Products p\nJOIN Categories c\n  ON p.CategoryID = c.CategoryID\nWHERE c.CategoryName = 'Produce'" },
  { gruppe: 'JOIN', titel: 'Beispiel 3: Durchschnittspreis pro Kategoriename', sql: 'SELECT c.CategoryName, AVG(p.Price) AS Durchschnittspreis\nFROM Products p\nJOIN Categories c\n  ON p.CategoryID = c.CategoryID\nGROUP BY c.CategoryName\nORDER BY Durchschnittspreis DESC' },
  { gruppe: 'JOIN', titel: 'JOIN: Kunden mit Bestellungen', sql: 'SELECT c.CustomerName, o.OrderID\nFROM Customers c\nJOIN Orders o\n  ON c.CustomerID = o.CustomerID' },
  { gruppe: 'JOIN', titel: 'LEFT JOIN: alle Kunden, auch ohne Bestellung', sql: 'SELECT c.CustomerName, o.OrderID\nFROM Customers c\nLEFT JOIN Orders o\n  ON c.CustomerID = o.CustomerID' },
  { gruppe: 'JOIN', titel: 'Beispiel 4: Kunden ohne Bestellung', sql: 'SELECT c.CustomerName, c.Country\nFROM Customers c\nLEFT JOIN Orders o\n  ON c.CustomerID = o.CustomerID\nWHERE o.OrderID IS NULL' },
  { gruppe: 'JOIN', titel: 'Beispiel 5: Umsatz pro Kategorie (drei Tabellen)', sql: 'SELECT c.CategoryName, SUM(d.Quantity * p.Price) AS Umsatz\nFROM OrderDetails d\nJOIN Products p ON d.ProductID = p.ProductID\nJOIN Categories c ON p.CategoryID = c.CategoryID\nGROUP BY c.CategoryName\nORDER BY Umsatz DESC' }
];
