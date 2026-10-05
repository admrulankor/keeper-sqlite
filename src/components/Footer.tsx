export default function Footer() {
    let currentYear = new Date().getFullYear();
    return (
        <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-gray-400">
            <p>&copy; {currentYear} Keeper. All rights reserved.</p>
        </footer>
    );
}