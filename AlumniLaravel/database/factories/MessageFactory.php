<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    public function definition(): array
    {
        $messages = [
            'Merhaba, şirketinizdeki staj imkânları hakkında bilgi alabilir miyim?',
            'Selam! Mezuniyet sonrası kariyer yolculuğunuz çok ilham verici, kısa bir görüşme yapabilir miyiz?',
            'CV\'mi gözden geçirip geri bildirim verebilir misiniz?',
            'Harika bir paylaşımdı, tebrikler!',
            'Hafta sonu mezunlar buluşmasına katılacak mısınız?',
            'Projeniz için ekibe öğrenci alıyor musunuz?',
            'Teşekkürler, önerileriniz çok işime yaradı.',
            'Ankara\'daki ofisinizde yarı zamanlı pozisyon var mı?',
            'ERP projelerinde hangi araçları kullanıyorsunuz?',
            'Mülakat sürecine nasıl hazırlanmamı önerirsiniz?',
        ];

        $sentAt = fake()->dateTimeBetween('-3 months', 'now');

        return [
            'sender_id' => User::factory(),
            'receiver_id' => User::factory(),
            'content' => fake()->randomElement($messages),
            'read_at' => fake()->boolean(60) ? fake()->dateTimeBetween($sentAt, 'now') : null,
            'created_at' => $sentAt,
            'updated_at' => $sentAt,
        ];
    }
}