
import React, { useEffect, useState } from 'react';
import './GreetingHeader.css';

interface GreetingHeaderProps {
    name: string;
    subText: string;
}

const GreetingHeader: React.FC<GreetingHeaderProps> = ({ name, subText }) => {
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 5) setGreeting('Selamat Malam 🌙');
        else if (hour < 11) setGreeting('Selamat Pagi ☀️');
        else if (hour < 15) setGreeting('Selamat Siang ☀️');
        else if (hour < 18) setGreeting('Selamat Sore 🌆');
        else setGreeting('Selamat Malam 🌙');
    }, []);

    return (
        <div className="greeting-wrapper animate-slideDown">
            <h1 className="greeting-text">
                👋 {greeting}, <span className="greeting-name">{name}</span>!
            </h1>
            <p className="greeting-sub">{subText}</p>
        </div>
    );
};

export default GreetingHeader;
